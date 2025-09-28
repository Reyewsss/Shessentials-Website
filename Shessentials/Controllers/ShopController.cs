using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Shessentials.Models;

namespace Shessentials.Controllers;

public class ShopController : Controller
{
    private readonly ILogger<ShopController> _logger;

    public ShopController(ILogger<ShopController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }

    public IActionResult PromoPage()
    {
        return View();
    }

    public IActionResult CartModal()
    {
        return View();
    }

      public IActionResult Checkout()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
