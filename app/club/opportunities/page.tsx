"use client";

import { useMemo } from "react";
import { Megaphone, Plus } from "lucide-react";
import { PageHeader } from "@/components/Navigation";
import { ClubOpportunityRow } from "@/components/ClubOpportunityRow";
import { EmptyState } from "@/components/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { useApp } from "@/lib/store";
import { daysUntil } from "@/lib/utils";

export default function ClubOpportunitiesPage() {
  const { clubProfile, opportunities, clubApplicants } = useApp();

  const mine = useMemo(
    () =>
      opportunities
        .filter((o) => o.organizerId === clubProfile.id)
        .sort((a, b) => {
          const aPast = daysUntil(a.date) < 0;
          const bPast = daysUntil(b.date) < 0;
          if (aPast !== bPast) return aPast ? 1 : -1;
          return daysUntil(a.date) - daysUntil(b.date);
        }),
    [opportunities, clubProfile.id],
  );

  return (
    <div>
      <PageHeader
        title="Opportunities"
        subtitle="Everything your club has published."
        action={
          <ButtonLink href="/club/opportunities/new">
            <Plus className="h-4 w-4" />
            Create Opportunity
          </ButtonLink>
        }
      />

      {mine.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No opportunities yet"
          description="Publish a trial or tournament and players near you will see it."
          action={<ButtonLink href="/club/opportunities/new">Create Opportunity</ButtonLink>}
        />
      ) : (
        <div className="space-y-3">
          {mine.map((o) => {
            const list = clubApplicants.filter((a) => a.opportunityId === o.id);
            return (
              <ClubOpportunityRow
                key={o.id}
                opportunity={o}
                applicantCount={list.length}
                newCount={list.filter((a) => a.status === "new").length}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
