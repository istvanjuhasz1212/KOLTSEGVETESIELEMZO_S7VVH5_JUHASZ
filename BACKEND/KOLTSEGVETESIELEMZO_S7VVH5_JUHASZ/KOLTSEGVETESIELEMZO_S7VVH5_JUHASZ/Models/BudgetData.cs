namespace FullStack.Models
{
    public class BudgetData
    {
        public List<Income> Incomes { get; set; } = new();
        public List<Expense> Expenses { get; set; } = new();
    }
}