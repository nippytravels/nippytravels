import { Avatar as BaseAvatar } from "@base-ui/react/avatar";

type Props = {
  imageUrl?: string;
  fallback: string;
  className?: string;
  alt?: string;
};

export default function Avatar({ imageUrl, fallback, className, alt }: Props) {
  return (
    <BaseAvatar.Root
      className={`inline-flex size-9 ${className} cursor-pointer items-center justify-center overflow-hidden rounded-sm bg-neutral-200 align-middle text-sm leading-none font-normal text-neutral-950 select-none dark:bg-neutral-800 dark:text-white`}
    >
      <BaseAvatar.Image
        src={imageUrl}
        width="48"
        height="48"
        className="size-full object-cover"
        alt={alt}
      />
      <BaseAvatar.Fallback
        delay={600}
        className="flex size-full items-center justify-center text-sm"
      >
        {fallback}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
