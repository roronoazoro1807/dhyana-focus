import { useEffect, useState } from 'react';

export function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-5xl text-primary drop-shadow-[0_0_8px_var(--primary)]">
      {time.toLocaleTimeString('hi-IN', { hour12: false })}
    </div>
  );
}