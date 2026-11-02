-- Extend the existing application status constraint; preserves all prior statuses.
ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS service_requests_status_check;
ALTER TABLE public.service_requests ADD CONSTRAINT service_requests_status_check CHECK (status IN (
  'Request Received', 'Awaiting Form Verification', 'Under Review',
  'Additional Information Required', 'Processing', 'Completed',
  'Unable to Process', 'Rejected', 'Refunded'
));
