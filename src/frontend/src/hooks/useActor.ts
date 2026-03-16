import { useEffect, useState } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

// Module-level cache so actor is shared across all components and created only once
let _actor: backendInterface | null = null;
let _promise: Promise<backendInterface> | null = null;
const _listeners: Set<(a: backendInterface) => void> = new Set();

function getOrCreateActor(): Promise<backendInterface> {
  if (_actor) return Promise.resolve(_actor);
  if (_promise) return _promise;
  _promise = createActorWithConfig()
    .then((a) => {
      _actor = a;
      for (const fn of _listeners) {
        fn(a);
      }
      _listeners.clear();
      return a;
    })
    .catch((err) => {
      _promise = null; // allow retry
      throw err;
    });
  return _promise;
}

export function useActor() {
  const [actor, setActor] = useState<backendInterface | null>(_actor);
  const [isFetching, setIsFetching] = useState(!_actor);

  useEffect(() => {
    if (_actor) {
      setActor(_actor);
      setIsFetching(false);
      return;
    }
    setIsFetching(true);
    const listener = (a: backendInterface) => {
      setActor(a);
      setIsFetching(false);
    };
    _listeners.add(listener);
    getOrCreateActor().catch((err) => {
      console.error("Failed to create backend actor:", err);
      setIsFetching(false);
      _listeners.delete(listener);
    });
    return () => {
      _listeners.delete(listener);
    };
  }, []);

  return { actor, isFetching };
}
