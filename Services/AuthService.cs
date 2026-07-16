using Announcement_and_Event_Track_App.Data;
using Announcement_and_Event_Track_App.Dtos.Auth;
using Announcement_and_Event_Track_App.Entitys;
using Announcement_and_Event_Track_App.Entitys.Enums;
using Announcement_and_Event_Track_App.Excepitons;
using Announcement_and_Event_Track_App.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Announcement_and_Event_Track_App.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly TokenService _tokenService;
    public AuthService(AppDbContext dbContext, IPasswordHasher<User> passwordHasher, TokenService tokenService)
    {
        _tokenService = tokenService;   
        _passwordHasher = new PasswordHasher<User>();
        _dbContext = dbContext;
    }
    
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        bool emailExists = await _dbContext.Users.AnyAsync(u => u.Email == request.Email);
        
        if (emailExists)
            throw new Exception("User with the same email already exists");

        var user = new User()
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Type = UserType.User,
            CreatedAt =  DateTime.UtcNow,
            IsActive = true,
            IsDeleted = false,
        };
        
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        return new AuthResponse()
        {
            Email = user.Email,
            Type = user.Type,
            Token = _tokenService.GenerateToken(user)
        };

    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var dbUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (dbUser is null)
            throw new UnauthorizedException("Email or Password incorrect");

        var result = _passwordHasher.VerifyHashedPassword(dbUser, dbUser.PasswordHash, request.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException("Email or Password incorrect");
        }

        return new AuthResponse()
        {
            Token = _tokenService.GenerateToken(dbUser),
            Email = dbUser.Email,
            Type = dbUser.Type
        };
    }
}