import { ReloadIcon } from '@radix-ui/react-icons';

export function LoadingSpinner() {
  return (
    <div className="absolute w-full h-full top-0 left-0 flex">
      <ReloadIcon className="mr-2 h-16 w-16 animate-spin" />
    </div>
  );
}
