import { motion } from "motion/react";

export function SlidingText({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) {
  return (
    <div className='overflow-hidden h-5 flex items-center'>
      <motion.span
        key={value}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
        className={className}>
        {value}
      </motion.span>
    </div>
  );
}
