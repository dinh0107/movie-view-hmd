type CardListProps = {
  title: string;
  data: { name: string; img: string }[];
};

export const CardListSection = ({ title, data }: CardListProps) => {
  return (
    <div className="w-full text-white py-8 px-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <a href="#" className="text-red-500 text-sm hover:underline">
          View All
        </a>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {data.map((item, i) => (
          <div
            key={i}
            className="relative w-56 h-32 flex-shrink-0 rounded-xl overflow-hidden group cursor-pointer"
          >
            <img
              src={item.img}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {item.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
