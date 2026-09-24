import "./mindup-score.css";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fffdf2] flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0d21a1] border-t-transparent" />
    </div>
  );
}