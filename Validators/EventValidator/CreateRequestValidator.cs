using FluentValidation;
using Announcement_and_Event_Track_App.Dtos.Event;
namespace Announcement_and_Event_Track_App.Validators.EventValidator;

public class CreateRequestValidator : AbstractValidator<CreateRequest>
{
    public CreateRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(30).WithMessage("Name cannot exceed 50 characters")
            .MinimumLength(3).WithMessage("Name cannot exceed 30 characters");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("CategoryId is required")
            .NotEqual(Guid.Empty).WithMessage("CategoryId is required");

        RuleFor(x => x.Description)
            .MaximumLength(200).WithMessage("Description cannot exceed 200 characters");
        
        RuleFor(x => x.Location)
            .MaximumLength(200).WithMessage("Location cannot exceed 200 characters");
        
        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start Date is required")
            .GreaterThanOrEqualTo(DateTime.Now).WithMessage("Start Date cannot be in the previous date");
        
        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End Date is required")
            .LessThanOrEqualTo(DateTime.Now).WithMessage("End Date cannot be in the previous date")
            .GreaterThan(x => x.StartDate).WithMessage("End date cannot be in the previous at start date");
    }
    
}