import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function UnverifiedSchemeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Official Application Link Not Available</DialogTitle>
          <DialogDescription className="mt-3 space-y-3 text-sm leading-relaxed text-ink/65">
            <p>
              Yojantra does not currently have a verified official government application link for
              this scheme.
            </p>
            <p>
              Some scheme information currently available in Yojantra is being used for
              informational/demonstration purposes while our official scheme-data integration is
              being developed.
            </p>
            <p>
              Please do not enter personal information or make payments through unofficial websites
              claiming to represent this scheme.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-ink px-5 py-2.5 text-[11px] font-semibold tracking-[.14em] text-ivory uppercase transition-colors hover:bg-saffron"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
