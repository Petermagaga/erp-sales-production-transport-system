// pages/MyLeave.jsx
import LeaveBalanceCards from "../components/LeaveBalanceCards";
import LeaveRequestForm from "../components/LeaveRequestForm";
import MyLeaveTable from "../components/MyLeaveTable";

export default function MyLeave() {
  return (
    <>
      <LeaveBalanceCards />
      <LeaveRequestForm />
      <MyLeaveTable />
    </>
  );
}
