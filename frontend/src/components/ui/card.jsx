export const Card = ({ children, className }) => (
  <div className={`rounded-xl border p-4 shadow ${className || ""}`}>
    {children}
  </div>
);

export const CardHeader = ({ children }) => (
  <div className="mb-2 font-semibold text-lg">{children}</div>
);

export const CardTitle = ({ children }) => (
  <h2 className="text-lg font-bold">{children}</h2>
);

export const CardContent = ({ children }) => <div>{children}</div>;
