type PolarisMarkProps = {
  className?: string;
};

export function PolarisMark({ className }: PolarisMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M64 10L74 46L118 64L74 82L64 118L54 82L10 64L54 46L64 10Z"
        fill="#0D5D78"
      />
      <path
        d="M64 20L70 48L98 64L70 80L64 108L58 80L30 64L58 48L64 20Z"
        fill="#FFFDF8"
      />
      <path
        d="M64 28L67.5 50.5L90 64L67.5 77.5L64 100L60.5 77.5L38 64L60.5 50.5L64 28Z"
        fill="#0D5D78"
      />
      <path
        d="M54 40L62 44L56 61H43L54 40Z"
        fill="#0D5D78"
      />
      <path
        d="M74 40L85 61H72L66 44L74 40Z"
        fill="#0D5D78"
      />
    </svg>
  );
}
