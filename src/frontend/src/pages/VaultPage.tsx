import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { T__2 as Memory } from "../backend.d";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { loadConfig } from "../config";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useStorageUpload } from "../hooks/useStorageUpload";
import { formatDate } from "../lib/helpers";

const SENTINEL = "!caf!";

async function getBlobUrl(blobId: string): Promise<string> {
  const config = await loadConfig();
  const hash = blobId.startsWith(SENTINEL)
    ? blobId.substring(SENTINEL.length)
    : blobId;
  return `${config.storage_gateway_url}/v1/blob/?blob_hash=${encodeURIComponent(hash)}&owner_id=${encodeURIComponent(config.backend_canister_id)}&project_id=${encodeURIComponent(config.project_id)}`;
}

export function VaultPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { uploadFile } = useStorageUpload();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("You");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const myPrincipal = identity?.getPrincipal().toUint8Array();

  const loadMemories = useCallback(async () => {
    if (!actor) return;
    const mems = await actor.getMemories();
    setMemories(mems);
    const urls: Record<string, string> = {};
    await Promise.all(
      mems
        .filter((m) => !!m.blobId)
        .map(async (m) => {
          try {
            const url = await getBlobUrl(m.blobId as string);
            urls[m.blobId as string] = url;
          } catch {
            // skip if URL construction fails
          }
        }),
    );
    setPhotoUrls(urls);
  }, [actor]);

  useEffect(() => {
    if (!actor) return;
    actor.getCallerUserProfile().then((p) => {
      if (p) setUserName(p.name);
    });
    loadMemories().finally(() => setLoading(false));
  }, [actor, loadMemories]);

  const handleAdd = async () => {
    if (!actor) return;
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      let blobId: string | null = null;
      if (photo) {
        blobId = await uploadFile(photo, (pct) => setUploadProgress(pct));
      }
      await actor.createMemory(
        userName,
        title.trim(),
        description.trim() || null,
        blobId,
      );
      setTitle("");
      setDescription("");
      setPhoto(null);
      setOpen(false);
      await loadMemories();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save memory.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    await actor.deleteMemory(id);
    await loadMemories();
  };

  const isOwn = (mem: Memory) => {
    if (!myPrincipal) return false;
    return (
      JSON.stringify(Array.from(mem.authorId)) ===
      JSON.stringify(Array.from(myPrincipal))
    );
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-pink-400 uppercase tracking-widest">
          {memories.length} {memories.length === 1 ? "memory" : "memories"}
        </span>
        <Button
          data-ocid="vault.open_modal_button"
          onClick={() => setOpen(true)}
          size="sm"
          className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl gap-1"
        >
          <Plus size={16} /> Add Memory
        </Button>
      </div>

      {loading ? (
        <div
          className="flex justify-center py-10"
          data-ocid="vault.loading_state"
        >
          <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : memories.length === 0 ? (
        <div
          data-ocid="vault.empty_state"
          className="text-center py-16 text-gray-400"
        >
          <ImageIcon size={40} className="mx-auto mb-3 text-pink-200" />
          <p className="text-sm">No memories yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {memories.map((mem, i) => (
            <div
              key={String(mem.id)}
              data-ocid={`vault.memory.item.${i + 1}`}
              className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden"
            >
              {mem.blobId && photoUrls[mem.blobId] && (
                <img
                  src={photoUrls[mem.blobId]}
                  alt={mem.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{mem.title}</h3>
                    {mem.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {mem.description}
                      </p>
                    )}
                  </div>
                  {isOwn(mem) && (
                    <button
                      type="button"
                      data-ocid={`vault.memory.delete_button.${i + 1}`}
                      onClick={() => handleDelete(mem.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>{mem.authorName}</span>
                  <span>{formatDate(mem.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-ocid="vault.dialog"
          className="rounded-2xl border-pink-100 max-w-sm mx-auto !bg-white"
          style={{ backgroundColor: "#ffffff", color: "#1f2937" }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#1f2937" }}>New Memory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label
                htmlFor="mem-title"
                className="text-xs"
                style={{ color: "#6b7280" }}
              >
                Title *
              </Label>
              <Input
                id="mem-title"
                data-ocid="vault.title_input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this memory a name"
                className="mt-1 rounded-xl border-pink-200"
                style={{ backgroundColor: "#fff", color: "#1f2937" }}
              />
            </div>
            <div>
              <Label
                htmlFor="mem-desc"
                className="text-xs"
                style={{ color: "#6b7280" }}
              >
                Description
              </Label>
              <Textarea
                id="mem-desc"
                data-ocid="vault.description_textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What made this moment special?"
                className="mt-1 rounded-xl border-pink-200 resize-none"
                style={{ backgroundColor: "#fff", color: "#1f2937" }}
                rows={3}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: "#6b7280" }}>
                Photo (optional)
              </Label>
              <label
                data-ocid="vault.upload_button"
                className="mt-1 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-pink-200 rounded-xl cursor-pointer hover:bg-pink-50 transition-colors"
              >
                <ImageIcon size={20} className="text-pink-300 mb-1" />
                <span className="text-xs" style={{ color: "#9ca3af" }}>
                  {photo ? photo.name : "Tap to upload a photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            {uploading && uploadProgress > 0 && (
              <div className="w-full bg-pink-100 rounded-full h-1.5">
                <div
                  className="bg-pink-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            {error && (
              <p data-ocid="vault.error_state" className="text-xs text-red-500">
                {error}
              </p>
            )}
            <Button
              data-ocid="vault.submit_button"
              onClick={handleAdd}
              disabled={uploading}
              className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
            >
              {uploading ? "Saving..." : "Save Memory"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
