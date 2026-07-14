using System.Threading.Tasks;
using Announcement_and_Event_Track_App.Entitys;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Announcement_and_Event_Track_App.Dtos.Category;
using Announcement_and_Event_Track_App.Services.Interfaces;

namespace Announcement_and_Event_Track_App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController
{
    
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }
    

    [HttpPost]
    public Task<Response> CreateAsync(CreateRequest createRequest)
    {
        return _categoryService.CreateAsync(createRequest);
    }

    [HttpGet]
    public Task<List<Response>> GetAllAsync(bool includeUnactivated = false)
    {
        return _categoryService.GetAllAsync(includeUnactivated);
    }

    [HttpGet("{id}")]
    public async Task<Response> GetById(
        Guid id,                                              
        [FromQuery] bool includeUnactivated = false)          
    {
        return await _categoryService.GetByIdAsync(id, includeUnactivated);
        
    }

    [HttpPut]
    public async Task<Response?> UpdateAsync(UpdateRequest updateRequest)
    {
        return await _categoryService.UpdateAsync(updateRequest);
    }
    

    [HttpPatch("{id}/deactivate")]
    public async Task<Response> Deactivate(Guid id)
    {
        return await _categoryService.DeactivateAsync(id);
    }

    [HttpDelete]
    public async Task<bool> DeleteAsync(Guid categoryId)
    {
        return await _categoryService.DeleteAsync(categoryId);
    }


    
    

    
}