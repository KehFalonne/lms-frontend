import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function Avatar({ src, alt, fallback, size = "md", className }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const imageSrc =
    src && !/^https?:\/\//i.test(src)
      ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}`.replace(
          /\/$/,
          ""
        ) + (src.startsWith("/") ? src : `/${src}`)
      : src;

  return (
    <div
      className={cn(
        "bg-primary/10 text-primary relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
        sizes[size],
        className
      )}
    >
      {imageSrc && !imageFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={alt ?? ""}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}
