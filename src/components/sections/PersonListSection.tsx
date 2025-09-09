import { actors } from "@/contants/mock-movies";
import { ChevronRight } from "lucide-react";

export default function PersonListSection() {
  return (
    <div className="w-full text-white py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Favorite Personality</h2>
        <button className="text-red-500 flex items-center gap-1">
          View All <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex gap-5 overflow-x-auto scrollbar-hide">
        {actors.map((actor, idx) => (
          <div key={idx} className="flex-shrink-0 w-[150px]">
            <div className="rounded-lg overflow-hidden">
              <img
                src={actor.img}
                alt={actor.name}
                className="w-full h-[200px] object-cover hover:scale-105 transition"
              />
            </div>
            <p className="mt-2 font-semibold text-sm text-center">
              {actor.name}
            </p>
            <p className="text-gray-400 text-xs text-center">{actor.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
