using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace Moduler.Web.Controllers
{
    public class StartController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Child()
        {
            return PartialView();
        }

        public ActionResult SuperChild()
        {
            Thread.Sleep(100);
            return PartialView();
        }

    }
}
