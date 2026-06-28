export function PhotoGrid({ photos }: { photos: string[] }) {
  if (!photos.length) {
    return <p className="text-sm text-slate-400">No photos yet.</p>;
  }
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {photos.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
        >
          <img
            src={url}
            alt="Job photo"
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        </a>
      ))}
    </div>
  );
}
