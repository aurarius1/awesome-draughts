using backend;
using backend.Commands;
using backend.Game;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IGameCache, GameCache>();
builder.Services.AddSingleton<ICommandFactory, CommandFactory>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "OK",
                      policy =>
                      {
                          policy.WithOrigins("*");
                          policy.WithHeaders("*");
                      });
});
var app = builder.Build();



var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromMinutes(2)
};
app.UseWebSockets(webSocketOptions);

app.UseHttpsRedirection();

app.UseAuthorization();
app.UseCors("OK");
app.MapControllers();

app.Run();
