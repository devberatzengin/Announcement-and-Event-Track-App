using FluentValidation;
using Announcement_and_Event_Track_App.Dtos.Event;
namespace Announcement_and_Event_Track_App.Validators.EventValidator;

public class UpdateRequestValidator : AbstractValidator<UpdateRequest>
{
    public UpdateRequestValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required")
            .NotEqual(Guid.Empty).WithMessage("Id is required");
    }
    
}