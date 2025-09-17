import { prisma } from '@/lib/prisma';
import DocumentA4 from '@/components/pdf/DocumentA4';

export const dynamic = 'force-dynamic';

export default async function PrintDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id }, include: { user: { include: { company: true } } } });
  if (!doc) return <div className="p-6">Not found.</div>;
  const data = (doc.data || {}) as any;

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-none p-0 m-0">
        <DocumentA4
          title={doc.title}
          documentNo={data.documentNo}
          documentDate={data.documentDate}
          sender={{
            company: doc.user.company?.name || '',
            vat: doc.user.company?.vat || '',
            address: doc.user.company?.address1 || '',
            city: doc.user.company?.city || '',
            country: doc.user.company?.country || '',
            iban: doc.user.company?.iban || '',
            bankName: (doc.user.company as any)?.bankName || undefined,
            bic: doc.user.company?.bic || undefined,
            logoUrl: (doc.user.company as any)?.logoUrl || undefined,
          }}
          recipient={{
            company: data.recipient?.company,
            name: data.recipient?.name,
            email: data.recipient?.email,
            address: data.recipient?.address,
            city: data.recipient?.city,
            country: data.recipient?.country,
          }}
          content={Array.isArray(data.content) ? data.content : undefined}
          notes={data.notes}
          footerText={data.footerText}
        />
      </main>
    </div>
  );
}

