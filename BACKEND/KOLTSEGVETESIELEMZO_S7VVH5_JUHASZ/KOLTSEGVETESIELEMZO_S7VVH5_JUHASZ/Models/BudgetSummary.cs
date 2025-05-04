using System.Text.Json.Serialization;

namespace FullStack.Models
{
    public class BudgetSummary
    {
        [JsonPropertyName("totalIncome")]
        public decimal TotalIncome { get; set; }

        [JsonPropertyName("totalExpenses")]
        public decimal TotalExpenses { get; set; }

        [JsonPropertyName("savings")]
        public decimal Savings { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = "savings";

        [JsonPropertyName("expensesByCategory")]
        public Dictionary<string, decimal> ExpensesByCategory { get; set; } = new();

        [JsonPropertyName("expenseWarning")]
        public string? ExpenseWarning { get; set; }
    }
}