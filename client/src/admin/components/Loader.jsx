import React from 'react';

const Loader = () => {
  return (
    <div className="grid gap-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-[2rem] bg-slate-100" />
      ))}
    </div>
  );
};

export default Loader;
