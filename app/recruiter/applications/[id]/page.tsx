import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { ApplicationDetailView } from "@/components/recruiter/application-detail";
import { getRecruiterApplicationDetail, updateRecruiterApplicationStatus } from "@/lib/recruiter/data";

export const dynamic = "force-dynamic";

export default async function RecruiterApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await getRecruiterApplicationDetail(id);

  if (!application) {
    notFound();
  }

  async function updateApplicationStatus(formData: FormData) {
    "use server";

    const status = formData.get("status")?.toString();
    if (!status || !["pending", "reviewing", "shortlisted", "rejected"].includes(status)) {
      return;
    }

    await updateRecruiterApplicationStatus(id, status as "pending" | "reviewing" | "shortlisted" | "rejected");
    revalidatePath("/recruiter");
    revalidatePath("/recruiter/applications");
    revalidatePath(`/recruiter/applications/${id}`);
  }

  return (
    <main>
      <ApplicationDetailView application={application} onStatusChange={updateApplicationStatus} />
    </main>
  );
}
