import { HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

const MOTOKO_DEDUPLICATION_SENTINEL = "!caf!";

export function useStorageUpload() {
  const uploadFile = async (
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<string> => {
    const config = await loadConfig();
    const agent = await HttpAgent.create({
      host: config.backend_host,
    });
    const storageClient = new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { hash } = await storageClient.putFile(bytes, onProgress);
    return MOTOKO_DEDUPLICATION_SENTINEL + hash;
  };

  return { uploadFile };
}
