import ProtectedRoute from "@/components/auth/protected-route";

export default function AdminHomePage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminHomeContent />
    </ProtectedRoute>
  );
}

function AdminHomeContent() {
  return "Protected!";
}
