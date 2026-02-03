// pages/MyLeave.jsx
import DashboardLayout from "../layout/DashboardLayout";
import LeaveBalanceCards from "../components/LeaveBalanceCards";
import LeaveRequestForm from "../components/LeaveRequestForm";
import MyLeaveTable from "../components/MyLeaveTable";

export default function MyLeave() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <LeaveBalanceCards />
        <LeaveRequestForm />
        <MyLeaveTable />
      </div>
    </DashboardLayout>
  );
}
