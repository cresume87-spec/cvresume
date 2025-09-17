import DocumentA4 from '@/components/pdf/DocumentA4';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

// Пропсы под Next 15: params/searchParams — Promise
type SharedDocumentPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SharedDocumentPage(props: SharedDocumentPageProps) {
  const { id } = await props.params;

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!doc) {
    notFound();
  }

  const data = (doc.data || {}) as any;

  return (
    <main className="bg-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg">
        <DocumentA4
          title={doc.title}
          documentNo={data.documentNo}
          documentDate={data.documentDate}
          sender={{
            company: doc.user?.company?.name || 'N/A',
            vat: doc.user?.company?.vat || undefined,
            address: doc.user?.company?.address1 || undefined,
            city: doc.user?.company?.city || undefined,
            country: doc.user?.company?.country || undefined,
            iban: doc.user?.company?.iban || undefined,
            bankName: (doc.user?.company as any)?.bankName || undefined,
            bic: doc.user?.company?.bic || undefined,
            logoUrl: (doc.user?.company as any)?.logoUrl || undefined,
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
      </div>
    </main>
  );
}



