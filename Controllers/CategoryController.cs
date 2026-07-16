using System.Threading.Tasks;
using Announcement_and_Event_Track_App.Entitys;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Announcement_and_Event_Track_App.Dtos.Category;
using Announcement_and_Event_Track_App.Services.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Announcement_and_Event_Track_App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }
    

    [HttpPost]
    [ProducesResponseType(typeof(Response), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response>> Create(CreateRequest createRequest)
    {
         var result = await _categoryService.CreateAsync(createRequest);
         
         return CreatedAtAction(
             nameof(GetById),
             new { id = result.Id },
             result);
    }

    [HttpGet]
    public async Task<ActionResult<List<Response>>> GetAll([FromQuery] bool includeUnactivated = false)
    {
        var result = await _categoryService.GetAllAsync(includeUnactivated);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Response>> GetById(Guid id, [FromQuery] bool includeUnactivated = false)          
    {
        var result = await _categoryService.GetByIdAsync(id, includeUnactivated);
        return Ok(result);
    }

    [HttpPut]
    public async Task<ActionResult<Response?>> Update(UpdateRequest updateRequest)
    {
        var result = await _categoryService.UpdateAsync(updateRequest);
        return Ok(result);
    }
    

    [HttpPatch("{id}/deactivate")]
    public async Task<ActionResult<Response>> Deactivate(Guid id)
    {
        var result = await _categoryService.DeactivateAsync(id);
        return Ok(result);
    }

    [HttpDelete]
    public async Task<ActionResult<bool>> Delete(Guid categoryId)
    {
        var result = await _categoryService.DeleteAsync(categoryId);
        return Ok(result);
    }
    
    
}