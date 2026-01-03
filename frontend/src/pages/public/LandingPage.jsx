import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div>
      <h1>Gagamatrix ERP</h1>
      <p>One ERP. Multiple Companies. Real Insights.</p>

      <Link to="/signup">
        <button>Start Free Trial</button>
      </Link>
    </div>
  );
};

export default LandingPage;
