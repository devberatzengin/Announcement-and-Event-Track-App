using Announcement_and_Event_Track_App.Dtos.Auth;

namespace Announcement_and_Event_Track_App.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}