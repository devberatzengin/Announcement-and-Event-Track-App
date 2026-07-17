using Announcement_and_Event_Track_App.Dtos.User;
using FluentValidation;

namespace Announcement_and_Event_Track_App.Validators.UserValidator;

public class UpdateRequestValidator : AbstractValidator<UpdateRequest>
{
    public UpdateRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().WithMessage("First name is required");
    }
}