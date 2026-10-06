import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo resmi ANGGA PART (`public/logo-ap.png`).
 * Diagram PNG transparan berwarna gelap, jadi dibutuhkan varian putih
 * (`logo-ap-invert.png`) ketika ditaruh di atas latar gelap.
 *
 * - variant "auto": mengikuti tema (gelap di light mode, putih di dark mode)
 * - variant "light": selalu logo gelap (cocok di latar terang)
 * - variant "dark": selalu logo putih (cocok di latar gelap / hero)
 */
export function Logo({
  className,
  variant = "auto",
}: {
  className?: string;
  variant?: "auto" | "light" | "dark";
}) {
  const shared = cn("shrink-0 object-contain", className);

  if (variant === "light") {
    return (
      <Image
        src="/logo-ap.png"
        alt="Logo ANGGA PART"
        width={499}
        height={499}
        priority
        className={shared}
      />
    );
  }

  if (variant === "dark") {
    return (
      <Image
        src="/logo-ap-invert.png"
        alt="Logo ANGGA PART"
        width={499}
        height={499}
        priority
        className={shared}
      />
    );
  }

  return (
    <>
      <Image
        src="/logo-ap.png"
        alt="Logo ANGGA PART"
        width={499}
        height={499}
        priority
        className={cn(shared, "block dark:hidden")}
      />
      <Image
        src="/logo-ap-invert.png"
        alt="Logo ANGGA PART"
        width={499}
        height={499}
        priority
        className={cn(shared, "hidden dark:block")}
      />
    </>
  );
}