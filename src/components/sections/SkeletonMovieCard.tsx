function SkeletonMovieCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-lg">
      <div className="aspect-[2/3] w-full bg-white/10" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/20 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
        <div className="h-8 bg-white/20 rounded w-1/2 mt-3" />
      </div>
    </div>
  );
}

export default SkeletonMovieCard;
