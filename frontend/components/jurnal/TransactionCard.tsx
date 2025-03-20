interface CardProps {
    title: string;
    value: number;
    type: "debit" | "credit" | "unbalanced";
    isBalanced?: boolean;
  }
  
  export function TransactionCard({ title, value, type, isBalanced }: CardProps) {
    const getBgColor = () => {
      if (type === "unbalanced" && isBalanced) {
        return "bg-emerald-100 border-emerald-200";
      }
      switch (type) {
        case "debit":
          return "bg-blue-100 border-blue-200";
        case "credit":
          return "bg-violet-100 border-violet-200";
        case "unbalanced":
          return "bg-red-100 border-red-200";
      }
    };
  
    const getTextColor = () => {
      if (type === "unbalanced" && isBalanced) {
        return "text-emerald-600";
      }
      switch (type) {
        case "debit":
          return "text-blue-600";
        case "credit":
          return "text-violet-600";
        case "unbalanced":
          return "text-red-600";
      }
    };
  
    return (
      <div className={`p-4 rounded-lg border ${getBgColor()} transition-colors`}>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className={`text-2xl font-bold mt-2 ${getTextColor()}`}>
          Rp {value.toLocaleString()}
        </p>
        {type === "unbalanced" && (
          <p className={`text-sm mt-1 ${getTextColor()}`}>
            {isBalanced ? "Seimbang" : "Tidak Seimbang"}
          </p>
        )}
      </div>
    );
  }