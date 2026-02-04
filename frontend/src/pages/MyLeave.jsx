// pages/MyLeave.jsx
import LeaveBalanceCards from "../components/LeaveBalanceCards";
import LeaveRequestForm from "../components/LeaveRequestForm";
import MyLeaveTable from "../components/MyLeaveTable";

export default function MyLeave() {
  return (
    <div className="space-y-6">
      <LeaveBalanceCards />
      <LeaveRequestForm />
      <MyLeaveTable />
    </div>
  );
}
