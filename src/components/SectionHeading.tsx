export default function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-1">
      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        {title}
      </h2>
      <div className="h-[1px] flex-1 bg-slate-100 italic"></div>
    </div>
  );
}
