using Announcement_and_Event_Track_App.Dtos.Category;
using FluentValidation;

namespace Announcement_and_Event_Track_App.Validators.CategoryValidator;

public class UpdateRequestValidator : AbstractValidator<UpdateRequest>
{
    public UpdateRequestValidator() {
        
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required")
            .NotEqual(Guid.Empty).WithMessage("Id is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MinimumLength(3).WithMessage("Name is required")
            .MaximumLength(20).WithMessage("Name is required");
        
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Type is required")
            .IsInEnum().WithMessage("Type is required");
    }
}