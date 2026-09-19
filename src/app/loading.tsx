import { Spinner } from "@/components/atoms";

export default function Page() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Spinner size={30} />
    </div>
  );
}
