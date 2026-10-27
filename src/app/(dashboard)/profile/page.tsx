"use client";
import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { primaryRoleLabel } from "@/lib/constants/routes";

export default function ProfilePage() {
    return (
        <AuthGate>
            <ProfileContent />
        </AuthGate>
    );
}

function ProfileContent() {
    const { user } = useAuth();
    if (!user) return null;

    const initials =
        `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

    return (
        <div>
            <PageHeader title="Profile" description="Your account information." />

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardContent className="flex flex-col items-center pt-8 pb-8 text-center">
                        <Avatar size="lg" fallback={initials} src={user.avatar || null} />
                        <h2 className="mt-4 text-lg font-semibold">
                            {user.firstName} {user.lastName}
                        </h2>
                        <p className="text-muted-foreground text-sm">{user.email}</p>
                        <div className="mt-3 flex flex-wrap justify-center gap-1">
                            {user.roles.length > 0 ? (
                                user.roles.map((r) => (
                                    <Badge key={r} variant="primary">
                                        {r}
                                    </Badge>
                                ))
                            ) : (
                                <Badge variant="outline">No role assigned</Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground mt-3 text-xs">
                            {primaryRoleLabel(user.roles)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <Row label="University ID" value={user.universityId} />
                        <Row label="Email" value={user.email} />
                        <Row label="First Name" value={user.firstName} />
                        {user.middleName && (
                            <Row label="Middle Name" value={user.middleName} />
                        )}
                        <Row label="Last Name" value={user.lastName} />
                        <Row label="Status" value={user.status} />
                        {user.studentProfile && (
                            <Row
                                label="Matricule"
                                value={user.studentProfile.matriculeNumber}
                            />
                        )}
                        {user.staffProfile && (
                            <Row
                                label="Staff Number"
                                value={user.staffProfile.staffNumber}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-border flex justify-between border-b pb-3 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
