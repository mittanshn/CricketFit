import pandas as pd

df = pd.read_csv("data_models/data.csv")

df["date"]= pd.to_datetime(df["date"])
df["week"] = df["date"].dt.to_period("W").astype(str)


print("CricketFit Training Logs")
print(df)

print("\nTotal Practice Minutes")
print(df["duration_minutes"].sum())

#print("\nAverage Fatigue Level")
#print(df["fatigue_level"].mean())

weekly_minutes = df.groupby(["week", "session_type"])["duration_minutes"].sum()
print("\nPractice Minutes by Week and Session Type")
print(weekly_minutes)

print("\n Average Performance by Session Type")
print(df.groupby("session_type")["performance_rating"].mean())


latest_week = df["week"].max()
latest_week_data = df[df["week"] == latest_week]

batting_minutes = latest_week_data[latest_week_data["session_type"] == "Batting"]["duration_minutes"].sum()
bowling_minutes = latest_week_data[latest_week_data["session_type"] == "Bowling"]["duration_minutes"].sum()
fitness_minutes = latest_week_data[latest_week_data["session_type"] == "Fitness"]["duration_minutes"].sum()
avg_fatigue = latest_week_data["fatigue_level"].mean()

user = "batting allrounder"

if user == "batsman":
    if batting_minutes >= 360:
        print("Good practice this week.")
    else:
        remaining = 360 - batting_minutes
        print(f"You need to bat {remaining} more minutes for this week.")


elif user == "bowler":
    if batting_minutes >= 60:
        print("Good batting practice this week.")
    else:
        remaining = 60 - batting_minutes
        print(f"You need to bat {remaining} more minutes for this week.")
    
    if bowling_minutes >= 240:
        print("Great bowling practice.")
    else:
        remaining = 240 - bowling_minutes
        print(f"You need to bowl {remaining} more minutes for this week.") 

elif user == "batting allrounder":
    if batting_minutes >= 240:
        print("Good batting practice this week.")
    else:
        remaining = 240 - batting_minutes
        print(f"You need to bat {remaining} more minutes for this week.")
    if bowling_minutes >= 120:
        print("Great bowling practice.")
    else:
        remaining = 120 - bowling_minutes
        print(f"You need to bowl {remaining} more minutes for this week.") 

elif user == "bowling allrounder":
    if batting_minutes >= 180:
        print("Good batting practice this week.")
    else:
        remaining = 180 - batting_minutes
        print(f"You need to bat {remaining} more minutes for this week.")
    if bowling_minutes >= 220:
        print("Great bowling practice.")
    else:
        remaining = 220 - bowling_minutes
        print(f"You need to bowl {remaining} more minutes for this week.") 


print("\nFatigue Recommendation")



if avg_fatigue >= 9:
    recommendation = "Tired, take a rest day."
elif avg_fatigue >= 7:
    recommendation = "Fatigue is a little high, do a lighter session."
else:
    recommendation = "Fatigue is okay, you can continue normal practice."

print(avg_fatigue, recommendation)

# Weekly summary table
weekly_summary = df.groupby("week").agg(
    total_minutes=("duration_minutes", "sum"),
    avg_fatigue=("fatigue_level", "mean"),
    avg_performance=("performance_rating", "mean")
)

weekly_type_minutes = df.pivot_table(
    index="week",
    columns="session_type",
    values="duration_minutes",
    aggfunc="sum",
    fill_value=0
)

weekly_summary = weekly_summary.join(weekly_type_minutes)

print("\nFull Weekly Summary")
print(weekly_summary)

# Training readiness score
latest_week_summary = weekly_summary.loc[latest_week]

training_score = 0

if latest_week_summary["total_minutes"] >= 300:
    training_score += 30

if latest_week_summary["avg_fatigue"] <= 6:
    training_score += 30

if latest_week_summary["avg_performance"] >= 7:
    training_score += 40

print("\nTraining Readiness Score")
print(f"{training_score}/100")