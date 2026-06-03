import { cn } from "@/lib/utils";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const ChatIcon = ({ size = 16, className, ...props }: IconProps) => (
  <svg
    viewBox='0 0 24 24'
    width={size}
    height={size}
    fill='currentColor'
    className={cn(className)}
    {...props}>
    <path d='M1.998 5.5a2.5 2.5 0 0 1 2.5-2.5h15a2.5 2.5 0 0 1 2.5 2.5v9a2.5 2.5 0 0 1-2.5 2.5h-5.586l-3.707 3.707A1 1 0 0 1 8.498 20v-3h-4a2.5 2.5 0 0 1-2.5-2.5v-9z' />
  </svg>
);

export const CloseIcon = ({ size = 16, className, ...props }: IconProps) => (
  <svg
    viewBox='0 0 24 24'
    width={size}
    height={size}
    fill='currentColor'
    className={cn(className)}
    {...props}>
    <path d='M6.293 6.293a1 1 0 0 1 1.414 0L12 10.586l4.293-4.293a1 1 0 1 1 1.414 1.414L13.414 12l4.293 4.293a1 1 0 0 1-1.414 1.414L12 13.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L10.586 12 6.293 7.707a1 1 0 0 1 0-1.414z' />
  </svg>
);

export const SendIcon = ({ size = 16, className, ...props }: IconProps) => (
  <svg
    viewBox='0 0 24 24'
    width={size}
    height={size}
    fill='currentColor'
    className={cn(className)}
    {...props}>
    <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
  </svg>
);

export const XIcon = ({ size = 16, className, ...props }: IconProps) => (
  <svg
    viewBox='0 0 24 24'
    width={size}
    height={size}
    fill='currentColor'
    className={cn(className)}
    {...props}>
    <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
  </svg>
);
