"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { movieService } from "@/services/apiService";

export default function SearchDialog() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (search.trim()) {
        setLoading(true);
        try {
          const movies = await movieService.searchMovies(search);
          setResults(movies);
        } catch (err) {
          console.error("Search error:", err);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSearch = () => {
    if (!search.trim()) return;
    setOpen(false);
    router.push(`/search?query=${encodeURIComponent(search)}`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setSearch("");
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary"
        >
          <Search className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="mt-[-12vh] w-full max-w-2xl rounded-2xl border-border/60 p-4 shadow-2xl sm:p-6">
        <DialogTitle className="mb-4 text-xl font-semibold text-primary">
          Tìm kiếm phim
        </DialogTitle>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Nhập tên phim..."
              className="h-12 rounded-xl pl-11 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
          <Button onClick={handleSearch} className="h-12 px-6">
            Tìm
          </Button>
        </div>

        <div className="mt-3 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : search.trim() === "" ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nhập từ khóa để tìm phim
            </p>
          ) : results.length > 0 ? (
            <ul className="space-y-1">
              {results.map((movie) => (
                <li key={movie.id}>
                  <Link
                    href={`/movies/${movie.slug}`}
                    onClick={() => {
                      setSearch("");
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-accent"
                  >
                    <img
                      src={movie.thumb_url}
                      alt={movie.name}
                      className="h-14 w-10 rounded-lg border border-border object-cover"
                    />
                    <span className="text-sm font-medium">{movie.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <XCircle className="mb-2 size-8 opacity-50" />
              <p className="text-sm">Không tìm thấy phim nào</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
