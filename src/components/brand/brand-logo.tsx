import { cn } from "@/lib/utils";

import Image from "next/image";

export function BrandLogo({
  className,
  showText = true
}: {
  className?: string;
  /**
   * When false, renders a smaller version of the logo for tight areas (footer/sidebar).
   * (We keep object-contain to preserve the image proportions on all screens.)
   */
  showText?: boolean;
}) {
  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="Decizyon - Eficiência que flui"
        // Keep the real aspect ratio to avoid distortion (mobile especially).
        width={2048}
        height={653}
        className={cn(
          showText
            ? "h-10 w-auto sm:h-12 md:h-16 lg:h-18 object-contain"
            : "h-10 w-auto object-contain"
        )}
        priority
      />
    </div>
  );
}

