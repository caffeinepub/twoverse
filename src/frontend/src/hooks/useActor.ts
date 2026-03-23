import { useEffect, useState } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

let cachedActor: backendInterface | null = null;
let actorPromise: Promise<backendInterface> | null = null;

async function getOrCreateActor(): Promise<backendInterface> {
  if (cachedActor) return cachedActor;
  if (actorPromise) return actorPromise;
  actorPromise = createActorWithConfig().then((actor) => {
    cachedActor = actor;
    return actor;
  });
  return actorPromise;
}

export function useActor() {
  const [actor, setActor] = useState<backendInterface | null>(cachedActor);
  const [isFetching, setIsFetching] = useState(!cachedActor);

  useEffect(() => {
    if (cachedActor) {
      setActor(cachedActor);
      setIsFetching(false);
      return;
    }
    setIsFetching(true);
    getOrCreateActor()
      .then((a) => {
        setActor(a);
        setIsFetching(false);
      })
      .catch((err) => {
        console.error("Failed to create actor:", err);
        setIsFetching(false);
      });
  }, []);

  return { actor, isFetching };
}
