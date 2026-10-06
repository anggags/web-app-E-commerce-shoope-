"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(searchQuery);
  const [syncedQuery, setSyncedQuery] = useState(searchQuery);

  if (searchQuery !== syncedQuery) {
    setSyncedQuery(searchQuery);
    setValue(searchQuery);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  return (
    <form onSubmit={submit} role="search" className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Cari produk, merek, atau toko..."
          aria-label="Cari produk"
          className="h-10 rounded-full pl-9 pr-9"
        />
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setValue("")}
            className="absolute right-1 top-1/2 size-8 -translate-y-1/2 rounded-full"
            aria-label="Bersihkan pencarian"
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
    </form>
  );
}
