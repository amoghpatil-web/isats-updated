
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import ApplyModal from '@/components/ApplyModal.jsx';

export default function ApplyNowButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="lg"
        className="isats-primary-button"
        onClick={() => setOpen(true)}
      >
        Apply now
        <ArrowRight size={18} />
      </Button>

      <ApplyModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
