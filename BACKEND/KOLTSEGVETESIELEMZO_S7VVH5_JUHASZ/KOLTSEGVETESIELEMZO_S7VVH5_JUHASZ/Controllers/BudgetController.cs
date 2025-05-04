using Microsoft.AspNetCore.Mvc;
using FullStack.Models;
using System.Collections.Generic;

namespace FullStack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BudgetController : ControllerBase
    {
        [HttpPost("analyze")]
        public IActionResult AnalyzeBudget([FromBody] BudgetData data)
        {
            if (data?.Incomes == null || data.Expenses == null)
            {
                return BadRequest("Érvénytelen bemeneti adatok");
            }

            decimal totalIncome = CalculateTotalIncome(data.Incomes);
            var (totalExpenses, expensesByCategory) = CalculateExpenses(data.Expenses);
            decimal savings = totalIncome - totalExpenses;

            var response = new BudgetSummary
            {
                TotalIncome = totalIncome,
                TotalExpenses = totalExpenses,
                Savings = savings,
                Status = savings >= 0 ? "savings" : "deficit",
                ExpensesByCategory = expensesByCategory,
                ExpenseWarning = totalExpenses > totalIncome * 0.8m ?
                    "Magas kiadási szint!" : null
            };

            return Ok(response);
        }
    }
}