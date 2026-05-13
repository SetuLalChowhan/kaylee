import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const DeadlineItem = ({ day, month, title, sub }) => (
  <div className="flex items-center gap-3 mb-4 last:mb-0 group cursor-pointer">
    <div className="flex flex-col items-center justify-center min-w-[32px] py-1 border-r border-gray-100 pr-3 mr-1">
      <span className="text-xs font-bold text-red-500 uppercase leading-none mb-0.5">{day}</span>
      <span className="text-[10px] font-semibold text-gray-400 uppercase leading-none">{month}</span>
    </div>
    <div>
      <h4 className="text-[13px] font-semibold text-[#1A1A1A] group-hover:text-Primary transition-colors leading-tight">{title}</h4>
      <p className="text-[11px] text-gray-400 font-medium">{sub}</p>
    </div>
  </div>
);

const TaskItem = ({ title, sub, date, completed }) => (
  <div className="flex items-center gap-3 mb-5 last:mb-0 group cursor-pointer">
    <div className="mt-0.5">
      {completed ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <Circle className="w-4 h-4 text-gray-200 group-hover:text-Primary transition-colors" />
      )}
    </div>
    <div className="flex-1">
      <h4 className={`text-[13px] font-semibold ${completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'} leading-tight`}>
        {title}
      </h4>
      <p className="text-[10px] text-Primary font-medium">{sub}</p>
    </div>
    <span className="text-[13px] font-medium text-[#6F6F6F] whitespace-nowrap">{date}</span>
  </div>
);

const DeadlinesSidebar = () => {
  const deadlines = [
    { day: "20", month: "Apr", title: "Gymshark", sub: "Spring Launch" },
    { day: "20", month: "Apr", title: "Gymshark", sub: "Spring Launch" },
    { day: "20", month: "Apr", title: "Nike", sub: "New Collection" },
  ];

  const tasks = [
    { title: "Review campaign brief", sub: "Nike UGC Shoot", date: "Wed, Apr 22", completed: false },
    { title: "Review campaign brief", sub: "Nike UGC Shoot", date: "Wed, Apr 26", completed: false },
    { title: "Review campaign brief", sub: "Nike UGC Shoot", date: "Wed, Apr 26", completed: false },
    { title: "Capture product photos", sub: "Content Creation", date: "Wed, Apr 24", completed: true },
  ];

  return (
    <div className="w-full lg:w-[320px] space-y-10 ">
      {/* Upcoming Deadlines */}
      <div className="bg-white p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Upcoming Deadlines</h2>
          <button className="text-Primary text-sm font-bold hover:underline flex items-center gap-1">
            See all <span className="text-sm">→</span>
          </button>
        </div>
        <div className="space-y-1">
          {deadlines.map((item, index) => (
            <DeadlineItem key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="bg-white p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Pending Tasks</h2>
          <button className="text-Primary text-sm font-bold hover:underline flex items-center gap-1">
            See all <span className="text-sm">→</span>
          </button>
        </div>
        <div className="space-y-1">
          {tasks.map((task, index) => (
            <TaskItem key={index} {...task} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeadlinesSidebar;
