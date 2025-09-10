"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Film, XCircle, Loader2 } from "lucide-react";
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
          className="text-white hover:text-red-400 cursor-pointer"
        >
          <Search className="w-6 h-6" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl w-full mt-[-15vh] p-4 md:p-6 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700">
        <DialogTitle className="text-xl font-semibold mb-4 text-red-400">
          Tìm kiếm phim
        </DialogTitle>

        <div className="relative md:mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              autoFocus
              placeholder="Nhập tên phim..."
              className="w-full bg-gray-900 border-gray-700 text-white placeholder-gray-400 text-lg pl-12 pr-4 py-3 h-12 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-red-500 hover:bg-red-600 text-white text-lg rounded-md h-12 px-6 cursor-pointer"
          >
            Tìm
          </Button>
        </div>

        <div className="mt-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-red-500 scrollbar-track-gray-800 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
          {loading ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            </div>
          ) : search.trim() === "" ? (
            <p className="text-gray-400 text-center py-4">
              Nhập từ khóa để tìm phim
            </p>
          ) : results.length > 0 ? (
            <ul className="space-y-2">
              {results.map((movie) => (
                <li key={movie.id}>
                  <Link
                    href={`/movies/${movie.slug}`}
                    onClick={() => {
                      setSearch("");
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                  >
                    <img
                      src={movie.thumb_url}
                      alt={movie.name}
                      className="w-10 h-14 object-cover rounded-md border border-gray-700"
                    />
                    <span className="text-white">{movie.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-gray-500">
              <XCircle className="w-8 h-8 mb-2 text-gray-600" />
              <p>Không tìm thấy phim nào</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
